import { Get, Route, Tags } from "tsoa";
import { UserSortEnum } from './../enums/index';
interface IEnum {
    text: string,
    value: string
}
@Route('/api/v1/enums')
@Tags("Enums")

export default class EnumController {
    @Get('/')
    public getEnums() {
        let enums: Array<IEnum> = [];
        let i = 0;
        for (const key in UserSortEnum) {
            if (Object.prototype.hasOwnProperty.call(UserSortEnum, key)) {
                const element = UserSortEnum[key];
                if (i < 3) {
                    enums.push({
                        text: `${element}`,
                        value: `${key}`
                    })
                    i++
                }
            }
        }
        return { UserSorting: enums };
    }
}