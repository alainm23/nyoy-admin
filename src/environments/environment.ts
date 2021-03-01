/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // firebase: {
  //   apiKey: "AIzaSyBbBoHDVlkR-XqwN4-iL7LwP5vqZqd32RQ",
  //   authDomain: "restaurantesapp-d9c89.firebaseapp.com",
  //   databaseURL: "https://restaurantesapp-d9c89.firebaseio.com",
  //   projectId: "restaurantesapp-d9c89",
  //   storageBucket: "restaurantesapp-d9c89.appspot.com",
  //   messagingSenderId: "934733338514",
  //   appId: "1:934733338514:web:dfd35aa568e71c38d8534b",
  //   measurementId: "G-T97DK881TB"
  // },
  firebase: {
    apiKey: "AIzaSyBjDSoRH6OtLBpEVU6oyu0g0pG2feE2oUk",
    authDomain: "nyoy-99c14.firebaseapp.com",
    databaseURL: "https://nyoy-99c14.firebaseio.com",
    projectId: "nyoy-99c14",
    storageBucket: "nyoy-99c14.appspot.com",
    messagingSenderId: "630090799162",
    appId: "1:630090799162:web:d49d244849f2da45eb3d03",
    measurementId: "G-GSRSFBWV1V"
  },
  algolia: {
    appId: 'TSKKEW5KF3',
    apiKey: 'a24c84e28c5a763053a059e9fbaca91d',
    indexName: 'Productos',
    urlSync: false
  }
};
