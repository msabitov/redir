// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: './service/worker.ts',
    output: {
        dir: 'dist',
        format: 'es',
        plugins: [terser()]
    },
    plugins: [
        typescript({
            tsconfig: 'tsconfig-service.json'
        })
    ]
};