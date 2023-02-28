import { registerProvider } from '../experimentation';
import BaseProvider from '../experimentation/baseprovider';
import type { ExperimentProviderConfig } from '../experimentation/types';
import type { VariationValue, Target } from '../types';

class TestProvider extends BaseProvider {
    initialize(_config: ExperimentProviderConfig): void {
    }
    startExperiment(_flagIdentifier: string, _variation: VariationValue, _target: Target): void {
    } 
}
const TestProviderSource = () => new TestProvider();

const randomProviderName = ()=>Math.random().toString(20).substring(2, 10);
let providerName: string;
let mockConsoleError;

beforeAll(() => {
    mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => {
    providerName = randomProviderName();
});

afterAll(() => {
    mockConsoleError.mockRestore();
});

afterEach(() => {
    mockConsoleError.mockClear();
});

describe('registerProvider', () => {
    test('it should register a new provider.', async() => {
        expect(registerProvider(providerName, TestProviderSource)).toBeTruthy();       
    });

    test('it should not register an existing provider.', async() => {
        registerProvider(providerName, TestProviderSource);
        expect(registerProvider(providerName, TestProviderSource)).toBeFalsy();
        expect(console.error).toHaveBeenCalled();
    });
});
