# ComplexManagement

Client for the `ComplexManagement` contract, which registers production sites ("complexes"). Each complex has a name, country, address, site type, industry and a geolocation stored in the `Geolocation` contract.

`addComplex` writes the complex location to `Geolocation`, so the contract must be linked to it (`setGeolocationContract`) and must own it. [`deploySystem`](../README.md#deploy-the-full-system) sets this up.

## Creating an instance

```typescript
import {
  ComplexManagement,
  Config,
} from '@digitalproductpassport/solidity-sdk';

const complexes = new ComplexManagement(Config.createSigner(), {
  address: '0x...', // defaults to COMPLEX_MANAGEMENT_ADDRESS
});
```

## Data types

```typescript
interface Complex {
  complexName: string;
  complexCountry: string;
  complexAddress: string;
  complexSiteType: string;
  complexIndustry: string;
  geolocationId: string;
}

// Input for addComplex: the complex plus its location
interface NewComplex extends Complex, GeoLocation {}

// Input for updateComplex: the geolocation cannot be changed
type ComplexUpdate = Omit<Complex, 'geolocationId'>;
```

## Methods

| Method                                             | Description                                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `deployComplexManagement(initialOwner?)`           | Deploys a new contract, connects the client to it, and returns its address.                    |
| `setGeolocationContract(address)`                  | Links the Geolocation contract. Owner only.                                                    |
| `getGeolocationContract()`                         | Returns the linked Geolocation address.                                                        |
| `addComplex(complexId, complex: NewComplex)`       | Registers a complex and stores its location. Reverts if the ID is empty or exists. Owner only. |
| `updateComplex(complexId, complex: ComplexUpdate)` | Updates a complex. Owner only.                                                                 |
| `removeComplex(complexId)`                         | Removes a complex. Its geolocation is kept. Owner only.                                        |
| `getComplex(complexId)`                            | Returns the `Complex`. Reverts if it does not exist.                                           |
| `getComplexGeolocation(complexId)`                 | Returns the complex location.                                                                  |
| `complexExists(complexId)`                         | Returns `true` if the complex exists.                                                          |
| `owner()` / `transferOwnership(newOwner)`          | Ownership of the contract.                                                                     |

## Example

```typescript
await complexes.addComplex('COMPLEX-1', {
  complexName: 'Vitoria Plant',
  complexCountry: 'Brazil',
  complexAddress: 'Av. Industrial, 100',
  complexSiteType: 'Factory',
  complexIndustry: 'Food',
  geolocationId: 'GEO-COMPLEX-1',
  latitude: '-20.3155',
  longitude: '-40.3128',
  additionalInfo: 'Main production site',
});

const location = await complexes.getComplexGeolocation('COMPLEX-1');
```

## License

MIT
