# mongoose-decorators
Define your mongoose models/schemas easily with Typescript decorators

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
TBA

## License
MIT

