require('dotenv').config();

const {AwsStorage} = require('.');

(async ()=>{
  let result = null;
  try{
    let content = {
      foo: "bork",
      count: 1
    };
    
    let storageTest = new AwsStorage(process.env.BUCKET_NAME, "test/bork.json");
    await storageTest.set(content);

    let retrieved = await storageTest.get();
    
    console.log('Set\n%o', content);
    console.log('Get\n%o', retrieved);
    process.exit(0);
  }catch(ex){
    console.error(ex);
    process.exit(-1);
  }
})()