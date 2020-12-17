# aws-storage
A simple convenience utility for storing and retrieving JSON data from AWS S3.

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

> Note, this library has a peer dependency on `aws-sdk` (specifically S3).