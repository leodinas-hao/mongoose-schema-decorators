import { suite, test } from '@testdeck/mocha';
import { assert } from 'chai';

import * as Mongoose from 'mongoose';
import {
  buildSchema,
  field, indexed, methods, required,
  schema, statics, unique,
  virtuals,
} from './';

/* Test entity classes with decorators */
@schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
class Service {
  @indexed
  @field(Mongoose.Schema.Types.ObjectId)
  public _id: Mongoose.Schema.Types.ObjectId;

  @field
  public product: string;

  @field
  public description: string;

  @field({ ref: 'Customer' })
  public customer: number;
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
  public _id: number;

  @field
  @indexed
  public name: string;

  @field(Date)
  public createdDate: Date;

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

/* test classes with nested schema */
class Kid {
  @field
  public firstname: string;

  @field
  public lastname: string;

  get fullname(): string {
    return `${this.firstname} ${this.lastname}`;
  }
}
class ClassRoom {
  @field
  public name: string;

  @field([Kid])
  public kids: [Kid];

  get count(): number {
    return this.kids ? this.kids.length : 0;
  }
}

@suite('Tester')
class Tester {
  @test('should build schema')
  public buildSchema() {
    const customerSchema = buildSchema(Customer);
    // console.log(customerSchema);

    assert.equal(customerSchema.get('toJSON').getters, true);
    assert.equal(customerSchema.get('toJSON').virtuals, true);

    assert.equal(3, this.pathCount(customerSchema));
    assert.equal('Number', (customerSchema.path('_id') as any).instance);
    assert.equal('String', (customerSchema.path('name') as any).instance);
    assert.equal('Date', (customerSchema.path('createdDate') as any).instance);
    assert.equal('Service', (customerSchema.virtualpath('services') as any).options.ref);

    assert.isNotNull(customerSchema.virtualpath('services'));
    assert.isNotNull(customerSchema.virtualpath('getRef'));

    const serviceSchema = buildSchema(Service);
    // console.log(serviceSchema);

    assert.equal(4, this.pathCount(serviceSchema));
    assert.equal('Number', (serviceSchema.path('customer') as any).instance);
    assert.equal('Customer', (serviceSchema.path('customer') as any).options['ref']);
  }

  @test('should build nested schema')
  public buildNestedSchema() {
    const nestedSchema = buildSchema(ClassRoom);
    // console.log(nestedSchema);

    assert.equal(3, this.pathCount(nestedSchema));
    assert.equal('Array', (nestedSchema.path('kids') as any).instance);
    assert.isTrue((nestedSchema.path('kids') as any).schema instanceof Mongoose.Schema);

    assert.isNotNull(nestedSchema.virtualpath('count'));

    // type classroomDoc = ClassRoom & Mongoose.Document;
    // const conn = Mongoose.createConnection('mongodb://localhost:27017/test-db');
    // conn.on('connected', () => {
    //   console.log('mongo db connected');
    //   const classRoomModel = conn.model<classroomDoc, Mongoose.Model<classroomDoc>>('Classroom', nestedSchema);
    //   const class1 = new classRoomModel({
    //     name: 'Class 1',
    //     kids: [{
    //       firstname: 'Vincent',
    //       lastname: 'Hao',
    //     }],
    //   });
    //   class1.save((err) => {
    //     if (err) { console.error(err); }
    //   });
    // });
    // conn.on('error', (err) => {
    //   console.error(err);
    // });
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
