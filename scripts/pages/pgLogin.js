const FlWaitMain = require("components/FlWaitMain");
const componentContextPatch = require("@smartface/contx/lib/smartface/componentContextPatch");
const Application = require("sf-core/application");
const ActionKeyType = require("sf-core/ui/actionkeytype");
const System = require("sf-core/device/system");
const extend = require('js-base/core/extend');
const PgLoginDesign = require('ui/ui_pgLogin');
const Fingerprint = require("sf-extension-utils/lib/fingerprint");
const { login } = require("services/user");
const Dialog = require("sf-core/ui/dialog");

const PgLogin = extend(PgLoginDesign)(
	function(_super, routeData, router) {
		_super(this);
		this.onShow = onShow.bind(this, this.onShow.bind(this));
		this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
		this.router = router;
	}
);

function onShow(superOnShow) {
	superOnShow();
	const page = this;
	const { fp } = page;
	fp.load();
}

function onLoad(superOnLoad) {
	superOnLoad();
	const page = this;
	const { svMain, tbUsername, tbPassword, swRememberMe, swUseFingerprint, btnLogin, flUseFingerprint } = page;
	svMain.autoSizeEnabled = true;
	swRememberMe.toggle = swUseFingerprint.toggle = true; //Defaults

	const getField = fieldName => {
		switch (fieldName) {
			case Fingerprint.FIELDS.USERNAME:
				return tbUsername.text;
			case Fingerprint.FIELDS.PASSWORD:
				return tbPassword.text;
			case Fingerprint.FIELDS.REMEMBER_ME:
				return swRememberMe.toggle;
			case Fingerprint.FIELDS.USE_FINGERPRINT:
				return swUseFingerprint.toggle;
			default:
				throw Error(`Invalid field name: ${fieldName}`);
		}
	};

	if (!System.fingerPrintAvailable) {
		flUseFingerprint.visible = false;
		swUseFingerprint.toggle = false;
	}

	const setField = (fieldName, value) => {
		switch (fieldName) {
			case Fingerprint.FIELDS.USERNAME:
				return tbUsername.text = value;
			case Fingerprint.FIELDS.PASSWORD:
				return tbPassword.text = value;
			case Fingerprint.FIELDS.REMEMBER_ME:
				//if remember me field is not in UI, the behaviour for remember me should be implemented here by returning true or false
				return swRememberMe.toggle = value;
			case Fingerprint.FIELDS.USE_FINGERPRINT:
				return swUseFingerprint.toggle = value;
			default:
				throw Error(`Invalid field name: ${fieldName}`);
		}
	};

	const loginHandler = (loginServiceResponse) => {
		page.router.push("/pages/page1");
	};

	var dialogCounter = 0;
	
	//Wraps service call with UI operation
	const loginService = (username, password) => {
		let dialogWait = new Dialog();
		componentContextPatch(dialogWait, `dialogWait${dialogCounter++}`);
		let waitContent = new FlWaitMain();
		dialogWait.layout.addChild(waitContent, "waitContent", ".wait-main");
		dialogWait.layout.applyLayout();
		Application.hideKeyboard();
		dialogWait.show();

		return login(username, password)
			.then(loginResult => {
				dialogWait.hide();
				return Promise.resolve(loginResult);
			})
			.catch(err => {
				dialogWait.hide();
				return Promise.reject(err);
			});
	};

	const fp = new Fingerprint({
		loginService,
		getField,
		setField,
		confirmUseFingerprintOnFirstLogin: true,
		loginHandler
	});

	page.fp = fp;

	const validate = () => {
		console.log("validation ", {
			"tbUsername.text.length": tbUsername.text.length,
			"fp.isFirstTime": fp.isFirstTime,
			"tbPassword.text.length": tbPassword.text.length
		});
		return tbUsername.text.length > 0 &&
			((fp.isFirstTime && tbPassword.text.length > 0) || !fp.firstTime);
	};

	btnLogin.onPress = () => {
		console.log("pressed to login");
		if (validate()) {
			console.log("valid");
			btnLogin.enabled = false;
			fp.loginWithFingerprint()
				.then(() => {
					console.log("Completed");
				})
				.catch(ex => {
					let message = ex;
					if (ex instanceof Error)
						message = System.OS === "Android" ? ex.stack : (ex.message + "\n\n*" + ex.stack);
					console.error("Fingerprint login error: ", message);
				})
				.finally(() => {
					btnLogin.enabled = true;
				});
		}
	};

	tbPassword.actionKeyType = tbUsername.actionKeyType = ActionKeyType.NEXT;
	tbPassword.onActionButtonPress = () => Application.hideKeyboard();
	tbUsername.onActionButtonPress = () => tbPassword.requestFocus();
}

module.exports = PgLogin;
