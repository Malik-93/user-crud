export interface IUser {
    id: string,
    name: string,
    email: string,
    phone: string,
    password: string,
    created_at?: number | string,
    updated_at?: number | string
}
export interface IUserFilter {
    qurey?: string,
    sortByEnumValue: string,
    isAscending?: boolean
    startDate?: string,
    endDate?: string,
}

export interface IUserResponse {
    message?: string,
    success?: boolean,
    statusCode?: number,
    error?: Error | TypeError | any,
    data?: Array<IUser | any>,
    docs?: any
}