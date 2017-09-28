# mongoose-schema-decorators

[![NPM version][npm-image]][npm-url]

Define your mongoose models/schemas easily with @decorators

## Installation
```
npm install mongoose-schema-decorators --save
```

## API
#### Functions
* **buildSchema(target: Function, loadClass:boolean = true)** - helper function to generate mongoose schema
    * {Function} target  name of the decorated class
    * {boolean} loadClass indicating if load setters + getters, static methods, and instance methods from the target class to schema. Default to true

#### Decorators
* **@schema(options?: Mongoose.SchemaTypeOpts<any>)** - decorates a class for mongoose schema generation
* **@field(options?: Mongoose.SchemaTypeOpts<any>)** - decorates a property with schema options if any
* **@required** - decorates a property which is a required field in schema
* **@indexed** - decorates a property which is a indexed field in schema
* **@unique** - decorates a property which is unique field in schema
* **@statics** - decorates a property/method which to be registered as schema statics
* **@methods** - decorates a method which to be registered as schema instance methods
* **@virtuals(options?: any)** - decorates a getter/setter/property (virtual reference to build relationship between collections) as schema virtuals

## Sample usage
```
interface Customer {
  _id: number;
  name: string;
  createdDate: Date;

  readonly services: Service[];
  readonly myGetter: string;
}

type CustomerDocument = Customer & Mongoose.Document;

@schema({
  toJSON: {
    getters: true,
    virtuals: true
  }
})
class CustomerClass extends Mongoose.Model implements Customer {
  @indexed
  @unique
  _id: number;

  @field
  @indexed
  @unique
  name: string;

  @field(Date)
  createdDate: Date;

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false
  })
  services: Service[];

  static Search(term: string): Promise<CustomerDocument[]> {
    let reg = new RegExp(term, 'i');
    return this.find({ name: reg }).exec();
  }

  get myGetter(): string {
    return 'sample getter';
  }
}

const CustomerSchema: Mongoose.Schema = buildSchema(CustomerClass);
```

## License
MIT

[npm-url]: https://www.npmjs.com/package/mongoose-schema-decorators
[npm-image]: https://img.shields.io/npm/v/mongoose-schema-decorators.svg?style=flat-square

