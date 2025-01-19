import { IProductRow } from "src/schema/Product.schema";

export const serializeProduct = (product: IProductRow) => {
    return `id=${product.id} title=${product.title} description=${product.description},`;
}

export default serializeProduct;
