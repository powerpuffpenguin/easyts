import {
    MaxUint8, MaxUint16, MaxUint32, MaxUint64,
    MinInt8, MinInt16, MinInt32, MinInt64,
    MaxInt8, MaxInt16, MaxInt32, MaxInt64,
} from './number'
QUnit.module('number', hooks => {
    QUnit.test('const', async (assert) => {
        function make(i: number | bigint, v0: string, v1: string, v2: string) {
            return {
                in: BigInt(i),
                v0: v0,
                v1: v1,
                v2: v2,
            }
        }
        const tests = [
            make(MaxUint8, "254", "255", "256"),
            make(MaxUint16, "65534", "65535", "65536"),
            make(MaxUint32, "4294967294", "4294967295", "4294967296"),
            make(MaxUint64, "18446744073709551614", "18446744073709551615", "18446744073709551616"),
            make(MinInt8, "-129", "-128", "-127"),
            make(MinInt16, "-32769", "-32768", "-32767"),
            make(MinInt32, "-2147483649", "-2147483648", "-2147483647"),
            make(MinInt64, "-9223372036854775809", "-9223372036854775808", "-9223372036854775807"),
            make(MaxInt8, "126", "127", "128"),
            make(MaxInt16, "32766", "32767", "32768"),
            make(MaxInt32, "2147483646", "2147483647", "2147483648"),
            make(MaxInt64, "9223372036854775806", "9223372036854775807", "9223372036854775808"),
        ]
        for (const tt of tests) {
            assert.equal((tt.in - BigInt(1)).toString(), tt.v0)
            assert.equal(tt.in.toString(), tt.v1)
            // assert.equal((tt.in + BigInt(1)).toString(), tt.v2)
        }

    })
})