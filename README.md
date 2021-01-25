# aws-storage
A simple convenience utility for storing and retrieving JSON data from AWS S3.

You can `set` a JSON object to an S3 bucket for storage.

When you subsequently `get` it from storage, the data is parsed into an object that is ready to use.

# Usage

```javascript
const {AwsStorage} = require('.');
(async ()=>{

  try{
    let content = {
      foo: "bar",
      count: 123
    };
    
    //Stores the content in the "stuff" bucket, at the key "test/content.json".
    let contentStorage = new AwsStorage("stuff", "test/content.json");
    await contentStorage.set(content);

    //Retrieves the content that was stored.
    let retrieved = await contentStorage.get();
    
    console.log('Set\n%o', content);
    console.log('Get\n%o', retrieved);
    
  }catch(ex){
    console.error(ex);
  }
})()
```
