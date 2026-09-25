import React from 'react';

/**
 * SastoMarts Reusable Accessible Table Foundation Component
 */
export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="table-wrapper">
      <table className={`table ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '' }) => (
  <thead className={className}>{children}</thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={className}>{children}</tbody>
);

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

export const TableHeaderCell = ({ children, className = '', ...props }) => (
  <th scope="col" className={className} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={className} {...props}>
    {children}
  </td>
);

export default Table;
