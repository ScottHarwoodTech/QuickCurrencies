// Modified from: https://gist.github.com/jskod/b0c8fc162b71b0eb8f931cf9bef7ba48?fbclid=IwAR0MXHk1d2mEEMgjRM5TIhw12yVyA4ouSHxU0IQ8goCUaTJxSw1ZOlQwSsU
// The basic idea of using a descriminator for seperation is the core bit I lifted
import { Document, model, Model, Schema } from "mongoose";

export function tenantModel<T extends Document>(
  name: string,
  schema: Schema,
  collection?: string,
  skipInit?: boolean
): (arg: { guildId: string }) => Model<T> {
  return ({ guildId }: { guildId: string }) => {
    // add new props to the schema
    schema.add({ guildId: String });

    // create a mongoose model
    const Model = model(name, schema, collection, skipInit);
    // set the descriminatorKey for the model
    Model.schema.set("discriminatorKey", "guildId");

    // set the descriminator name
    const discriminatorName = `${name}-${guildId}`;

    // check if a descriminator already exists
    const existingDiscriminator = (Model.discriminators || {})[
      discriminatorName
    ];

    // if it does exist, simply return that. Otherwise create new
    return (
      existingDiscriminator ||
      Model.discriminator(discriminatorName, new Schema({}), `${guildId}`)
    );
  };
}

export function tenantlessModel<T extends Document>(
  name: string,
  schema: Schema,
  collection?: string,
  skipInit?: boolean
): Model<T> {
  return model(name, schema, collection, skipInit);
}
