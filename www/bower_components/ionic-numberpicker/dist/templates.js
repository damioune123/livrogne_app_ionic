(function(module) {
try {
  module = angular.module('ionic-numberpicker.templates');
} catch (e) {
  module = angular.module('ionic-numberpicker.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('ionic-numberpicker-decimal.html',
    '<div class=DecimalPickerChildDiv><div class=row><label class="col col-offset-10 col-10 numberPickerDecimal" ng-show=isNegative>-</label> <label class="col col-offset-10 col-10 numberPickerDecimal" ng-hide=isNegative></label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark numberPickerArrows marginBottom10" ng-click=increaseWhole()><i class="icon ion-chevron-up"></i></button><div ng-bind=wholeNumber class="ipBoxes numberPickerBoxText"></div><button type=button class="button button-clear button-small button-dark numberPickerArrows marginTop10" ng-click=decreaseWhole()><i class="icon ion-chevron-down"></i></button></span> <label class="col col-10 numberPickerDecimal">{{ decimalCharacter }}</label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark numberPickerArrows marginBottom10" ng-click=increaseDecimal()><i class="icon ion-chevron-up"></i></button><div ng-bind=decimalDisplay() class="ipBoxes numberPickerBoxText"></div><button type=button class="button button-clear button-small button-dark numberPickerArrows marginTop10" ng-click=decreaseDecimal()><i class="icon ion-chevron-down"></i></button></span> <label class="col numberPickerDecimal">{{ unit }}</label></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ionic-numberpicker.templates');
} catch (e) {
  module = angular.module('ionic-numberpicker.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('ionic-numberpicker-whole.html',
    '<div class=WholeNumberPickerChildDiv><div class=row><label class="col col-offset-25 col-10 numberPickerDecimal" ng-show=isNegative>-</label> <label class="col col-offset-25 col-10 numberPickerDecimal" ng-hide=isNegative></label> <span class="button-small col col-25"><button type=button class="button button-clear button-small button-dark numberPickerArrows marginBottom10" ng-click=increaseWhole()><i class="icon ion-chevron-up"></i></button><div ng-bind=wholeNumber class="ipBoxes numberPickerBoxText"></div><button type=button class="button button-clear button-small button-dark numberPickerArrows marginTop10" ng-click=decreaseWhole()><i class="icon ion-chevron-down"></i></button></span> <label class="col numberPickerDecimal">{{ unit }}</label></div></div>');
}]);
})();
