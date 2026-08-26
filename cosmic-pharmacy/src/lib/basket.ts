import type { BasketLine, Product } from '../data/types';
import { hasNumericPrice } from './catalog';

export interface BasketSummary {
  /** Sum over lines whose product has a usable numeric price. */
  subtotalBzd: number;
  pricedLineCount: number;
  confirmPriceLineCount: number;
  itemCount: number;
}

export function summarizeBasket(lines: BasketLine[], lookup: (id: string) => Product | undefined): BasketSummary {
  let subtotalBzd = 0;
  let pricedLineCount = 0;
  let confirmPriceLineCount = 0;
  let itemCount = 0;

  for (const line of lines) {
    const product = lookup(line.productId);
    if (!product) continue;
    itemCount += line.quantity;
    if (hasNumericPrice(product)) {
      subtotalBzd += (product.priceBzd as number) * line.quantity;
      pricedLineCount += 1;
    } else {
      confirmPriceLineCount += 1;
    }
  }

  return { subtotalBzd, pricedLineCount, confirmPriceLineCount, itemCount };
}
