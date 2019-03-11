const extend = require('js-base/core/extend');
const FlWaitMainDesign = require('library/FlWaitMain');

const FlWaitMain = extend(FlWaitMainDesign)(
	// Constructor
	function(_super, props = {}, pageName) {
		// Initalizes super class for this scope
		_super(this, props);
		this.pageName = pageName;
	}
);

module.exports = FlWaitMain;
