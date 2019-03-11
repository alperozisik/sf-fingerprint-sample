const Application = require("sf-core/application");
const Button = require("sf-core/ui/button");
const extend = require('js-base/core/extend');
const PageWithContx = require('@smartface/contx/lib/smartface/PageWithContx');
const SecureData = require("sf-core/global/securedata");
const ButtonPage = extend(PageWithContx)(
    function(_super) {
        _super(this);
        this.onShow = onShow.bind(this, this.onShow.bind(this));
        this.onLoad = onLoad.bind(this, this.onLoad.bind(this));
    }
);

function onShow(superOnShow) {
    Application.statusBar.visible = false;
    this.headerBar.visible = false;
}

function onLoad(superOnLoad) {
    this.headerBar.leftItemEnabled = false;
    superOnLoad && superOnLoad();

    var secure = new SecureData({
        ios: {
            service: "com.myapp.serviceparameter"
        },
        key: "keyparameter"
    });

    secure.save({ value: "password" }).then((resolvedValue) => {
        console.log(resolvedValue);
    }, (error) => {
        console.log(error);
    });
    var isSaved = false;
    var btnSave = new Button({
        text: "Save",
        onPress: function() {
            secure.save({ value: "password" }).then((resolvedValue) => {
                isSaved = true;
            }, (error) => {
                console.log(error);
            });
        }
    });
    var btnDel = new Button({
        text: "Delete",
        onPress: function() {
            if (isSaved) { // for Android this must be checked  
                secure.delete({ value: "top secretpassword" }).then((resolvedValue) => {
                    console.log(resolvedValue);
                }, (error) => {
                    console.log(error);
                });
                isSaved = false;
            }
            else {
                alert("There is no data to delete.");
            }
        }
    });
    var btnRead = new Button({
        text: "Read",
        onPress: function() {
            if (isSaved) { // for Android this must be checked                       
                secure.read().then((resolvedValue) => {
                    console.log(resolvedValue);
                }, (error) => {
                    console.log(error);
                });
            }
            else {
                alert("There is no data to read.")
            }
        }
    });

    this.layout.addChild(btnSave, "btnSave", ".sf-button", function(userProps) {
        userProps.width = 250;
        userProps.top = 100;
        userProps.left = 80;
        return userProps;
    });
    this.layout.addChild(btnDel, "btnDel", ".sf-button", function(userProps) {
        userProps.width = 250;
        userProps.top = 180;
        userProps.left = 80;
        return userProps;
    });
    this.layout.addChild(btnRead, "btnRead", ".sf-button", function(userProps) {
        userProps.width = 250;
        userProps.top = 250;
        userProps.left = 80;
        return userProps;
    });
    this.layout.applyLayout();
}
module.exports = ButtonPage;
