import { variation, enhancedVariation } from '../variation'; // Modify the import based on your file structure.

describe('variation', () => {
    it('should return the stored value when it exists', () => {
        const storage = { testFlag: true };
        const mockMetricsHandler = jest.fn();

        const result = variation(storage, 'testFlag', false, mockMetricsHandler);

        expect(result).toBe(true);
        expect(mockMetricsHandler).toBeCalledWith('testFlag', true);
    });

    it('should return the default value when stored value is undefined', () => {
        const storage = {};
        const mockMetricsHandler = jest.fn();

        const result = variation(storage, 'testFlag', false, mockMetricsHandler);

        expect(result).toBe(false);
        expect(mockMetricsHandler).toBeCalledWith('testFlag', undefined);
    });
});

describe('enhancedVariation', () => {
    it('should return success type with the stored value when it exists', () => {
        const storage = { testFlag: true };
        const mockMetricsHandler = jest.fn();

        const result = enhancedVariation(storage, 'testFlag', false, mockMetricsHandler);

        expect(result.type).toBe('success');

        if (result.type === 'success') {
            expect(result.value).toBe(true);
        }

        expect(mockMetricsHandler).toBeCalledWith('testFlag', true);
    });


    it('should return error type with default value when flag is missing', () => {
        const storage = {};
        const mockMetricsHandler = jest.fn();

        const result = enhancedVariation(storage, 'testFlag', false, mockMetricsHandler);

        expect(result.type).toBe('error');
        if (result.type === 'error') {
            expect(result.defaultValue).toBe(false);
            expect(result.message).toBe('The flag "testFlag" does not exist in storage.');
        }

    });

    it('should return error type with default value when stored value is undefined', () => {
        const storage = { testFlag: undefined };
        const mockMetricsHandler = jest.fn();

        const result = enhancedVariation(storage, 'testFlag', false, mockMetricsHandler);

        expect(result.type).toBe('error');
        if (result.type === 'error') {
            expect(result.defaultValue).toBe(false);
            expect(result.message).toBe('The variation value for flag "testFlag" is undefined. Returning default value.');
        }

    });
});
