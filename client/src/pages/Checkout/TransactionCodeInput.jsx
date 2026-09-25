import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common';
import { FormField } from '../../components/forms/FormField.jsx';
import { Input } from '../../components/forms/Input.jsx';

/**
 * TransactionCodeInput
 * Dedicated transaction reference code input with validation and accessibility guards.
 */
export const TransactionCodeInput = ({
  value = '',
  onChange,
  onBlur,
  error = null,
  disabled = false,
  selectedMethod = 'esewa',
}) => {
  const methodHints = {
    esewa: 'Found under "Transaction ID" or "Ref No" in your eSewa payment receipt statement.',
    khalti: 'Found as "Transaction ID" or "Khalti ID" on your success screen.',
    mypay: 'Found as "Reference ID" or "Txn Code" in your MyPay history.',
    cod_50_50: 'Enter the 50% advance deposit transaction reference ID from your wallet.',
  };

  const currentHint = methodHints[selectedMethod] || 'Enter the exact transaction reference code from your payment receipt';

  return (
    <Card className="checkout-transaction-code" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Transaction Reference Code"
        description="Enter the unique alphanumeric payment confirmation ID provided by your digital wallet"
      />
      <CardBody>
        <FormField
          label="Wallet Transaction / Reference Code"
          required
          error={error}
          hint={currentHint}
        >
          <Input
            id="checkout-transaction-code-input"
            name="transactionCode"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Enter the transaction/reference code from your payment receipt"
            hasError={Boolean(error)}
            disabled={disabled}
            maxLength={100}
            style={{ fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}
          />
        </FormField>
      </CardBody>
    </Card>
  );
};

export default TransactionCodeInput;
