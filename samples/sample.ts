import * as Mongoose from 'mongoose';

import {
  buildSchema,
  field, indexed, methods, required,
  schema, statics, unique,
  virtuals,
} from '../src';

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
