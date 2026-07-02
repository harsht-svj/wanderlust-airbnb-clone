const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
require("dotenv").config();

main()
.then(()=>{
    console.log("connection SuccessFul");
});

async function main(){
   await mongoose.connect(process.env.MONGO_URL);
  
}

const initDb=async()=>{
    await listing.deleteMany({});
    const newData = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId('6a46ebcc37eed1e4de70beb7')
}));

await listing.insertMany(newData);
    console.log("data was initialised");

};

initDb();