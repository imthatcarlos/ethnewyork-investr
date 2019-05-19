import React from 'react';

import apartmentPhoto from './../assets/asset1.jpeg';

function ListingItem() {
  return (
    <div class="item-container">
      <div class="item-photo-container">
        <img style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}} src={apartmentPhoto}/>
      </div>
      <div class="item-description-container">
        <h2>689 Lorimer Street</h2>
        <div>
          <p>3 BDR</p>
          <p>2 BTH</p>
        </div>
        <p>3.5M/5M raised</p>
        <button>Invest</button>
      </div>
    </div>
  );
}

export default ListingItem;
