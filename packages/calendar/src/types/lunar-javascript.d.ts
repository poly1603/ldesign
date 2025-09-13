/**
 * lunar-javascript 库的类型声明
 */

declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar
    static fromYmd(year: number, month: number, day: number): Lunar
    
    getYear(): number
    getMonth(): number
    getDay(): number
    getYearInChinese(): string
    getMonthInChinese(): string
    getDayInChinese(): string
    isLeapMonth(): boolean
    setLeapMonth(isLeap: boolean): void
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getYearZodiac(): string
    getConstellation(): string
    getFestivals(): string[]
    getJieQi(): string | null
    getDayYi(): string[]
    getDayJi(): string[]
    getSolar(): Solar
  }
  
  export class Solar {
    getYear(): number
    getMonth(): number
    getDay(): number
  }
}
