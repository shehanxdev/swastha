import axios from 'myaxios';
import * as apiroutes from '../../apiroutes'
import localStorageService from './localStorageService'

class TableDownloadData {

    //Get All Orders
    getAllOrders = async (params) => {
        const accessToken = await localStorageService.getItem('accessToken')
        const promise = new Promise((resolve, reject) => {
            axios
                .get(apiroutes.ORDER_EXCHANGES, {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                })
                .then((res) => {
                    return resolve(res)
                })
                .catch((error) => {
                    console.log('error', error)
                    return resolve(error)
                })
        })
        return await promise
    }

}

export default new TableDownloadData()