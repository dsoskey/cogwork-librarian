import { generateTabReducer } from './projectTabs'

describe('tabReducer', () => {
  const mockSetter = vi.fn();
  const testReducer = generateTabReducer(mockSetter);

  beforeEach(() => {
    mockSetter.mockReset();
  })

  describe('delete', () => {
    test('should remove a non-selected tab', () => {
      const nextState = testReducer(
        { active: ['1', '2', '3'], selectedIndex: 1 },
        { type: 'delete', paths: new Set(['3']) }
      );
      expect(nextState).toEqual({ active: ['1', '2'], selectedIndex: 1 });
      expect(mockSetter).toBeCalledWith(nextState);
    });

    test('should not remove a selected tab', () => {
      const nextState = testReducer(
        { active: ['1', '2', '3'], selectedIndex: 1 },
        { type: 'delete', paths: new Set(['2']) }
      );
      expect(nextState).toEqual({ active: ['1', '2', '3'], selectedIndex: 1 });
    });

  })
})
