import { ProductCodes } from "../productCodes";
export const getProductTypeByBranchCode = (bransKodu) => {
  for (let key in ProductCodes) {
    if (ProductCodes[key].code === bransKodu) {
      return ProductCodes[key].name;
    }
  }
};
