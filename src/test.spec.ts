import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import * as Mongoose from 'mongoose';
import {
  buildSchema,
  field, indexed, methods, required,
  schema, statics, unique,
  virtuals,
} from './';

class Customer {
  @indexed
  @unique
  public _id: number;

  @field
  public name: string;

  @virtuals({
    ref: 'Service',
    localField: '_id',
    foreignField: 'customer',
    justOne: false,
  })
  public services: Service[];
}

class Service {
  @field(Mongoose.Schema.Types.ObjectId)
  public _id: Mongoose.Schema.Types.ObjectId;

  @field
  public product: string;

  @field
  public description: string;

  @field({ ref: 'Customer' })
  public customer: number;
}

class NestClass {
  @field
  public name: string;
  @field
  public sub: {
    prop1: string;
  };
}

@suite('Tester')
class Tester {
  @test('should build Customer schema')
  public buildCustomerSchema() {
    const customerSchema = buildSchema(Customer);
    // console.log(customerSchema);
    assert.equal(2, this.pathCount(customerSchema));
    assert.equal('Number', (customerSchema.path('_id') as any).instance);
    assert.equal('String', (customerSchema.path('name') as any).instance);
    assert.equal('Service', (customerSchema.virtualpath('services') as any).options.ref);
    // console.log(customerSchema.virtualpath('services'));
  }

  @test('should build Service schema')
  public buildServiceSchema() {
    const serviceSchema = buildSchema(Service);
    // console.log(serviceSchema);
    assert.equal(4, this.pathCount(serviceSchema));
  }

  @test('nested schema')
  public nestedSchema() {
    const s = new Mongoose.Schema({
      name: String,
      sub: {
        prop1: String,
      },
    });
    console.log(s);

    const ss = buildSchema(NestClass);
    console.log(ss);
  }

  private pathCount(s: Mongoose.Schema): number {
    let count = 0;
    s.eachPath((path, type) => {
      count++;
      // print schema
      // console.info(`${path}: ${(type as any).instance};`);
    });
    return count;
  }
}
