import { BadRequestError } from './badRequestError.js';

/**
 * Creates an immutable point-in-time delivery address snapshot for an Order.
 * Isolates historical order records from any subsequent customer address edits.
 * @param {object} address - Address mongoose document or plain object
 * @returns {object} Immutable snapshot object
 */
export function createDeliveryAddressSnapshot(address) {
  if (!address || typeof address !== 'object') {
    throw new BadRequestError('Valid delivery address is required for order creation');
  }

  const fullName = String(address.fullName || '').trim();
  const phone = String(address.phone || '').trim();
  const tole = String(address.tole || '').trim();
  const wardNumber = Number(address.wardNumber);
  const municipality = String(address.municipality || '').trim();
  const district = String(address.district || '').trim();
  const province = String(address.province || '').trim();
  const country = String(address.country || 'Nepal').trim();
  const landmark = address.landmark ? String(address.landmark).trim() : null;
  const label = address.label ? String(address.label).trim() : 'Home';

  if (!fullName) throw new BadRequestError('Recipient full name is required in delivery address');
  if (!phone) throw new BadRequestError('Recipient phone number is required in delivery address');
  if (!tole) throw new BadRequestError('Tole/Street is required in delivery address');
  if (!municipality) throw new BadRequestError('Municipality is required in delivery address');
  if (!district) throw new BadRequestError('District is required in delivery address');
  if (!province) throw new BadRequestError('Province is required in delivery address');

  return Object.freeze({
    fullName,
    phone,
    label,
    tole,
    wardNumber: Number.isFinite(wardNumber) ? wardNumber : 1,
    municipality,
    district,
    province,
    country,
    landmark,
  });
}

export default {
  createDeliveryAddressSnapshot,
};
