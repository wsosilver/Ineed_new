const replace = require('replace-in-file');

console.log('------------------------------------------------------------------------------------------');
console.log("Running cordova hook");
console.log('------------------------------------------------------------------------------------------');

const options = {
  files: 'platforms/android/CordovaLib/src/org/apache/cordova/CordovaInterfaceImpl.java',

  //Replacement to make (string or regex)
  from: 'if(callback == null && initCallbackService != null)',
  to: 'if( initCallbackService != null)',
};

try {
  let changedFiles = replace.sync(options);
  console.log('Modified files:', changedFiles.join(', '));
}
catch (error) {
  console.error('Error occurred:', error);
}

console.log('-----------------------------------------------------------------------------------------');
