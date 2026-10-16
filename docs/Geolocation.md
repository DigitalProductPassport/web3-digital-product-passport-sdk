# Geolocation

Client for the `Geolocation` contract, which stores locations under a string ID.

With the standard deployment ([`deploySystem`](../README.md#deploy-the-full-system)), `Geolocation` is owned by `ComplexManagement`, so new locations are created through `ComplexManagement.addComplex`, and the write methods below revert when called from your account. Use them when you deploy and own a `Geolocation` contract yourself.

## Creating an instance

```typescript
import { Config, Geolocation } from '@digitalproductpassport/solidity-sdk';

const geolocation = new Geolocation(Config.createSigner(), {
  address: '0x...', // defaults to GEOLOCATION_ADDRESS
});
```

## Data types

```typescript
interface GeoLocation {
  latitude: string; // 1 to 20 characters
  longitude: string; // 1 to 20 characters
  additionalInfo: string;
}
```

## Methods

| Method                                    | Description                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `deployGeolocation(initialOwner?)`        | Deploys a new contract, connects the client to it, and returns its address. |
| `setGeolocation(id, location)`            | Stores a location, overwriting any location with the same ID. Owner only.   |
| `updateGeolocation(id, location)`         | Updates an existing location. Owner only.                                   |
| `removeGeolocation(id)`                   | Removes a location. Owner only.                                             |
| `getGeolocation(id)`                      | Returns the location. Unknown IDs return empty strings.                     |
| `geolocationExists(id)`                   | Returns `true` if the location exists.                                      |
| `owner()` / `transferOwnership(newOwner)` | Ownership of the contract.                                                  |

## Example

```typescript
await geolocation.deployGeolocation();
await geolocation.setGeolocation('GEO-1', {
  latitude: '-20.3155',
  longitude: '-40.3128',
  additionalInfo: 'Main production site',
});

const location = await geolocation.getGeolocation('GEO-1');
```

## License

MIT
