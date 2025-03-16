import React from 'react';
import { formatDistance } from 'date-fns';

const ClaimHistory = ({ claims }) => {
  return (
    <div className="claim-history">
      <h3>Claim History</h3>
      
      {claims.length === 0 ? (
        <p className="no-claims">No claims recorded yet</p>
      ) : (
        <div className="table-container">
          <table className="claims-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>IP Address</th>
                <th>Session ID</th>
                <th>Claimed</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td>{claim.coupon?.code || 'Deleted Coupon'}</td>
                  <td>{claim.ipAddress}</td>
                  <td>{claim.sessionId.substring(0, 8)}...</td>
                  <td title={new Date(claim.claimedAt).toLocaleString()}>
                    {formatDistance(new Date(claim.claimedAt), new Date(), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClaimHistory;