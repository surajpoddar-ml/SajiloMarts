const NPR_PER_INR_FIXED_PEG = 1.6;

export const convertInrToNpr = (inrAmount) => {
  return Number((inrAmount * NPR_PER_INR_FIXED_PEG).toFixed(2));
};

export const convertNprToInr = (nprAmount) => {
  return Number((nprAmount / NPR_PER_INR_FIXED_PEG).toFixed(2));
};

export const formatPrice = (amount, currency = 'NPR') => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 2,
  }).format(amount);
};
