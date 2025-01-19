import mongoose, { Schema, Document } from "mongoose";

interface IProductDocument extends IProductDto, IProductInternal, Document {}

interface IProductInternal {
  embeddings: number[];
  createdAt: Date;
  updatedAt: Date;
}

interface IProductDto {
  title: string;
  description: string;
  keywords: string[];
}

interface IProductRow extends IProductInternal, IProductDto {
  id: string;
}

interface IProductFilterData extends IProductDto {
  _id: string;
}

const ProductSchema = new Schema<IProductDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  embeddings: {
    type: [Number],
    validate: {
      validator: (array) => array.every((num) => typeof num === "number"),
      message: "All elements embeddings in the array must be numbers (ProductModel)",
    },
    required: true,
  },
  keywords: {
    type: [String],
    validate: {
      validator: (array) => array.every((num) => typeof num === "string"),
      message: "All elements keywords in the array must be string (ProductModel)",
    },
    required: true,
  },
});

const ProductModel = mongoose.model<IProductDocument>("product", ProductSchema);

export {
  ProductModel,
  IProductDocument,
  IProductDto,
  IProductFilterData,
  IProductRow,
};
