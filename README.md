# mongoose-schema-decorators

[![NPM version][npm-image]][npm-url]
[![Downloads][download-badge]][npm-url]

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
```js
@schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
class Service {
  @indexed
  @field(Mongoose.Schema.Types.ObjectId)
  _id: Mongoose.Schema.Types.ObjectId;

  @field
  product: string;

  @field
  description: string;

  @field({ ref: 'Customer' })
  customer: number;
}

@schema({ _id: false })
class Contact {
  @field
  public firstname: string;

  @field
  public lastname: string;

  @field
  public phone: string;

  @field
  public address: string;
}

@schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
class Customer {
  @indexed
  @unique
  _id: number;

  @field
  @indexed
  name: string;

  @field(Date)
  createdDate: Date;

  @field([Contact])
  contacts: [Contact];

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false,
  })
  public services: Service[];

  get getRef(): string {
    return `${this._id}-${this.name}`;
  }
}

const serviceSchema: Mongoose.Schema = buildSchema(Service);
type ServiceDocument = Service & Mongoose.Document;
const ServiceModel = Mongoose.model<ServiceDocument, Mongoose.Model<ServiceDocument>>('Service', serviceSchema);

const CustomerSchema: Mongoose.Schema = buildSchema(Customer);
type CustomerDocument = Customer & Mongoose.Document;
const CustomerModel = Mongoose.model<CustomerDocument, Mongoose.Model<CustomerDocument>>('Customer', CustomerSchema);

const customer1 = new CustomerModel({
  _id: 1,
  name: 'customer one',
  createdDate: Date.now(),
});
customer1.save();

const service1 = new ServiceModel({
  product: 'S1',
  description: 'service one',
  customer: 1,
} as Service);
service1.save();
```

## License
MIT

[npm-url]: https://www.npmjs.com/package/mongoose-schema-decorators
[npm-image]: https://img.shields.io/npm/v/mongoose-schema-decorators.svg?style=flat-square
[download-badge]: https://img.shields.io/npm/dm/mongoose-schema-decorators.svg?style=flat-square 

