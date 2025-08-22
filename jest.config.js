const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
    preset: 'ts-jest', // 重要
    collectCoverageFrom: ['<rootDir>/assets/**/*.ts'],
    testEnvironment: 'jsdom', // 需要；因为目前引擎依赖一点 DOM 环境
    testRegex: [String.raw`tests[\/\\].*\.(test|spec)?\.(ts|tsx)$`], // 这个路径看你自己的安排
    moduleFileExtensions: ['ts', 'js', 'json', 'node', 'jsx'],
    transform: {
        ...tsJestTransformCfg,
    },
    moduleNameMapper: {
        '^cc$': '<rootDir>/tests/test_tool/cc.ts',
    },
};
