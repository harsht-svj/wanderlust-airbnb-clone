const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");

main()
.then(()=>{
    console.log("connection SuccessFul");
});

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
}

const initDb=async()=>{
    await listing.deleteMany({});
    const newData = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId('6a44ebf65e73f8cd020c3458')
}));

await listing.insertMany(newData);
    console.log("data was initialised");

};

initDb();