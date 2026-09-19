import { CROSS_BORDER_PEG } from '../constants/currency.js';

export const convertInrToNpr = (inrAmount) => {
  return Number((inrAmount * CROSS_BORDER_PEG.INR_TO_NPR_RATE).toFixed(2));
};

export const convertNprToInr = (nprAmount) => {
  return Number((nprAmount / CROSS_BORDER_PEG.INR_TO_NPR_RATE).toFixed(2));
};
