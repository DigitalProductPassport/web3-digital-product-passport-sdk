import { expect } from 'chai';
import { ethers } from 'ethers';
import { network } from 'hardhat';
import {
  Batch,
  ComplexManagement,
  Geolocation,
  ProductPassports,
  connectSystem,
  deploySystem,
  silentLogger,
} from '../src/index.js';
import {
  COMPLEX_ID,
  complex,
  expectRejection,
  product,
  warehouse,
} from './fixtures.js';

const { ethers: hhEthers } = await network.create();
const [owner, other] = await hhEthers.getSigners();
const options = { logger: silentLogger };

const deployWithProduct = async () => {
  const system = await deploySystem(owner, options);
  await system.complexManagement.addComplex(COMPLEX_ID, complex);
  await system.productPassport.createProduct(1, product);
  return system;
};

describe('deploySystem', function () {
  it('deploys and wires every contract', async function () {
    const {
      geolocation,
      complexManagement,
      productPassport,
      batch,
      addresses,
    } = await deploySystem(owner, options);

    expect(await complexManagement.getGeolocationContract()).to.equal(
      addresses.geolocation,
    );
    expect(await productPassport.getComplexManagement()).to.equal(
      addresses.complexManagement,
    );
    expect(await batch.getContract().productPassport()).to.equal(
      addresses.productPassport,
    );
    expect(await geolocation.owner()).to.equal(addresses.complexManagement);
    expect(await productPassport.owner()).to.equal(owner.address);
  });

  it('hands ownership to initialOwner after wiring', async function () {
    const { complexManagement, productPassport, batch } = await deploySystem(
      owner,
      {
        ...options,
        initialOwner: other.address,
      },
    );

    expect(await complexManagement.owner()).to.equal(other.address);
    expect(await productPassport.owner()).to.equal(other.address);
    expect(await batch.owner()).to.equal(other.address);
  });

  it('applies the gas price from gweiBid', async function () {
    const { complexManagement } = await deploySystem(owner, {
      ...options,
      gweiBid: 7,
    });
    const receipt = await complexManagement.addComplex(COMPLEX_ID, complex);

    expect(receipt.gasPrice).to.equal(ethers.parseUnits('7', 'gwei'));
  });

  it('connects clients to existing addresses', async function () {
    const { addresses } = await deployWithProduct();
    const connected = connectSystem(owner, addresses, options);

    expect(await connected.productPassport.productExists(1)).to.equal(true);
    expect(
      await connected.complexManagement.complexExists(COMPLEX_ID),
    ).to.equal(true);
  });
});

describe('Geolocation', function () {
  it('sets, updates and removes locations', async function () {
    const geolocation = new Geolocation(owner, options);
    await geolocation.deployGeolocation();

    await geolocation.setGeolocation('GEO-1', {
      latitude: '1.0',
      longitude: '2.0',
      additionalInfo: 'a',
    });
    expect(await geolocation.getGeolocation('GEO-1')).to.deep.equal({
      latitude: '1.0',
      longitude: '2.0',
      additionalInfo: 'a',
    });

    await geolocation.updateGeolocation('GEO-1', {
      latitude: '3.0',
      longitude: '4.0',
      additionalInfo: 'b',
    });
    expect((await geolocation.getGeolocation('GEO-1')).latitude).to.equal(
      '3.0',
    );

    await geolocation.removeGeolocation('GEO-1');
    expect(await geolocation.geolocationExists('GEO-1')).to.equal(false);
  });

  it('reports the revert reason for invalid coordinates', async function () {
    const geolocation = new Geolocation(owner, options);
    await geolocation.deployGeolocation();

    await expectRejection(
      geolocation.setGeolocation('GEO-1', {
        latitude: '',
        longitude: '2.0',
        additionalInfo: '',
      }),
      'Failed to set geolocation: Latitude cannot be empty',
    );
  });
});

describe('ComplexManagement', function () {
  it('adds a complex and stores its geolocation', async function () {
    const { complexManagement, geolocation } = await deploySystem(
      owner,
      options,
    );
    await complexManagement.addComplex(COMPLEX_ID, complex);

    expect(await complexManagement.getComplex(COMPLEX_ID)).to.deep.equal({
      complexName: complex.complexName,
      complexCountry: complex.complexCountry,
      complexAddress: complex.complexAddress,
      complexSiteType: complex.complexSiteType,
      complexIndustry: complex.complexIndustry,
      geolocationId: complex.geolocationId,
    });
    expect(
      (await complexManagement.getComplexGeolocation(COMPLEX_ID)).latitude,
    ).to.equal(complex.latitude);
    expect(await geolocation.geolocationExists(complex.geolocationId)).to.equal(
      true,
    );
  });

  it('updates and removes a complex', async function () {
    const { complexManagement } = await deploySystem(owner, options);
    await complexManagement.addComplex(COMPLEX_ID, complex);

    await complexManagement.updateComplex(COMPLEX_ID, {
      ...complex,
      complexName: 'Renamed Plant',
    });
    expect(
      (await complexManagement.getComplex(COMPLEX_ID)).complexName,
    ).to.equal('Renamed Plant');

    await complexManagement.removeComplex(COMPLEX_ID);
    expect(await complexManagement.complexExists(COMPLEX_ID)).to.equal(false);
  });

  it('rejects duplicate complex IDs', async function () {
    const { complexManagement } = await deploySystem(owner, options);
    await complexManagement.addComplex(COMPLEX_ID, complex);

    await expectRejection(
      complexManagement.addComplex(COMPLEX_ID, complex),
      'Failed to add complex: Complex ID already exists',
    );
  });
});

describe('ProductPassports', function () {
  it('creates a product and returns it with its origin', async function () {
    const { productPassport } = await deployWithProduct();

    const details = await productPassport.getProductDetails(1);
    expect(details.product).to.deep.equal(product);
    expect(details.origin).to.deep.equal({
      latitude: complex.latitude,
      longitude: complex.longitude,
      additionalInfo: complex.additionalInfo,
    });
    expect(await productPassport.getProduct(1)).to.deep.equal(product);
  });

  it('updates a product without changing its complex', async function () {
    const { productPassport } = await deployWithProduct();

    await productPassport.updateProduct(1, {
      ...product,
      description: 'Brigadeiro Gourmet',
    });

    const updated = await productPassport.getProduct(1);
    expect(updated.description).to.equal('Brigadeiro Gourmet');
    expect(updated.complexId).to.equal(COMPLEX_ID);
  });

  it('removes a product', async function () {
    const { productPassport } = await deployWithProduct();

    await productPassport.removeProduct(1);

    expect(await productPassport.productExists(1)).to.equal(false);
    await expectRejection(
      productPassport.getProductDetails(1),
      'Failed to retrieve product: Product does not exist',
    );
  });

  it('rejects products for unknown complexes', async function () {
    const { productPassport } = await deploySystem(owner, options);

    await expectRejection(
      productPassport.createProduct(1, { ...product, complexId: 'MISSING' }),
      'Failed to create product: Complex does not exist',
    );
  });

  it('rejects writes from accounts that are not the owner', async function () {
    const { addresses } = await deployWithProduct();
    const asOther = new ProductPassports(other, {
      ...options,
      address: addresses.productPassport,
    });

    await expectRejection(
      asOther.createProduct(2, product),
      'Failed to create product',
    );
  });

  it('throws when the client is not connected to a contract', async function () {
    const client = new ProductPassports(owner, { ...options, address: '' });

    expect(await client.getAddress()).to.equal(null);
    await expectRejection(
      client.productExists(1),
      'ProductPassport contract address is not initialized.',
    );
  });
});

describe('Batch', function () {
  const newBatch = {
    amount: 100,
    assemblingTime: 3600,
    transportDetails: 'Truck BR-101',
    productId: 1,
  };

  it('creates a batch and mints its NFT', async function () {
    const { batch } = await deployWithProduct();

    await batch.createBatch(1, newBatch);

    expect(await batch.getBatch(1)).to.deep.equal({
      amount: 100n,
      assemblingTime: 3600n,
      transportDetails: 'Truck BR-101',
      currentGeolocationId: complex.geolocationId,
      originGeolocationId: complex.geolocationId,
    });
    expect(await batch.ownerOf(1)).to.equal(owner.address);
  });

  it('moves a batch to an existing geolocation', async function () {
    const { batch, complexManagement } = await deployWithProduct();
    await batch.createBatch(1, newBatch);
    await complexManagement.addComplex('WAREHOUSE-1', warehouse);

    await batch.updateBatchLocation(1, warehouse.geolocationId);

    const details = await batch.getBatchDetails(1, 1);
    expect(details.batch.currentGeolocationId).to.equal(
      warehouse.geolocationId,
    );
    expect(details.currentLocation.latitude).to.equal(warehouse.latitude);
    expect(details.originLocation.latitude).to.equal(complex.latitude);
    expect(details.product).to.deep.equal(product);
    expect(details.complex.complexName).to.equal(complex.complexName);
  });

  it('cannot create new geolocations when ComplexManagement owns Geolocation', async function () {
    const { batch } = await deployWithProduct();
    await batch.createBatch(1, newBatch);

    await expectRejection(
      batch.updateBatchLocation(1, 'GEO-NEW', {
        latitude: '1.0',
        longitude: '2.0',
        additionalInfo: '',
      }),
      'Failed to update batch location',
    );
  });

  it('sets the token URI of a batch', async function () {
    const { batch } = await deployWithProduct();
    await batch.createBatch(1, newBatch);

    await batch.setTokenURI(1, 'ipfs://QmBatchMetadata');

    expect(await batch.tokenURI(1)).to.equal('ipfs://QmBatchMetadata');
  });

  it('rejects batches for unknown products', async function () {
    const { batch } = await deployWithProduct();

    await expectRejection(
      batch.createBatch(1, { ...newBatch, productId: 99 }),
      'Failed to create batch: Product does not exist',
    );
  });
});

describe('Clients', function () {
  it('deploy each contract on its own', async function () {
    const clients = [
      () => new Geolocation(owner, options).deployGeolocation(),
      () => new ComplexManagement(owner, options).deployComplexManagement(),
      () =>
        new ProductPassports(owner, options).deployProductPassport(
          other.address,
        ),
      () => new Batch(owner, options).deployBatch(),
    ];

    for (const deploy of clients) {
      expect(ethers.isAddress(await deploy())).to.equal(true);
    }
  });
});
