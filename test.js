
// import AAA from "./t2.js";
// console.log(AAA)
// const aaa = new AAA();



// import MiniHDLC from "./build/MiniHDLC"

// const MiniHDLC = require("./build/MiniHDLC");

// console.log(MiniHDLC);

// const myHDLC = new MiniHDLC();

// console.log(myHDLC);

// const miniHDLC = MiniHDLC.MiniHDLC;

// miniHDLC.encode(new Uint8Array(2));

import { Marty } from "./dist/Marty.js"
import { DiscoveredRIC } from "./dist/RICTypes.js";

const myMarty = new Marty();
// const encoded = myMarty.encode(new Uint8Array(5));
// console.log(encoded);

console.log("Here")

const rslt = myMarty.connect(new DiscoveredRIC("192.168.86.98", "Marty"));

rslt.then(()=>{
    console.log("OK")
    let ricName = myMarty.getRICName()
    console.log("ricName")
    ricName.then(()=>{
        console.log("ricName", ricName)
    },()=>console.log("FailedRICName"))
},()=>{console.log("Failed")})



// if (rslt) {
//     console.log(await myMarty.getAddOnList())

//     await new Promise(resolve => setTimeout(resolve, 5000));
// } else {
//     console.log("Failed to connect to RIC")
// }