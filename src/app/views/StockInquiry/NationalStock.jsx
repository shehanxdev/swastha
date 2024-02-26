import React, { Component, Fragment } from "react";
import {
    LoonsTable,
    LoonsCard,
    MainContainer,
} from "app/components/LoonsLabComponents";
import { Grid, CircularProgress } from '@material-ui/core'
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import WarehouseServices from "app/services/WarehouseServices";
import Card from '@mui/material/Card';


class StockInquiryNationalStock extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loaded: false,
            alert: false,
            message: "",
            severity: 'success',
            totalItems:null,
            instituteQty:[],

            formData :{
                search_type: 'ItemSum',
                exd_wise: true,
                item_id: null,
                batchwise:true,
                quantity_grater_than_zero:true,
                not_expired: true,
            },

            data: [],
            columns: [
                {
                    name: 'exd',
                    label: 'Expiry Date',
                    options: {
                        display: true,
                    },
                },
                {
                    name: 'quantity',
                    label: 'Qty',
                    options: {
                        display: true,
                    },
                },
            ]
        }
    }

    async getNationalStock(){

        let item = this.props.sr_no

        let params2 = this.state.formData
        params2.item_id = item

            let batch_res2 = await WarehouseServices.getSingleItemWarehouse(params2)
            if (batch_res2.status === 200) {
                console.log('nat-----befour---------dhdhdd--.>>>>>', batch_res2.data.view)
                let dataOut = batch_res2.data.view.data.filter((e)=>(
                    e.item_id === item
                ))
                console.log('nat-----fgfgfgfgfgfgfgf---------dhdhdd--.>>>>>', dataOut)
                
                this.setState({
                    instituteQty: dataOut,
                },()=>{
                    setTimeout(() => {
                        this.setState({
                            loaded:true
                        })
                    }, 300);
                })
            }
    }





    componentDidMount() {
       this.getNationalStock()
    }

    render() {
        return (
            <Fragment>
                <Grid container className="px-main-4 m-1">
                    <Card className="p-3 w-full" >
                    {/* // <ValidatorForm > */}
                       {/* <fieldset style={{ borderWidth: 1, borderRadius: 5, borderColor: '#0000FF', borderStyle: 'solid', width:'100%', margin: 2, height:'350px', overflow:'auto'}}> */}
                            <legend style={{ alignSelf: 'center', fontWeight:'bold', border:'1px solid blue ', borderRadius: 10, paddingLeft:10, backgroundColor:'blue', color:'white' }}>National Stock</legend>
                            <Grid container style={{height:'350px', overflow:'auto'}}>
                               <Grid item xs={12}>
                               {this.state.loaded ?
                                    <LoonsTable
                                        //title={"All Aptitute Tests"}
                                        id={'allAptitute'}
                                        data={this.state.instituteQty}
                                        columns={this.state.columns}

                                        options={{
                                            pagination: false,
                                            serverSide: true,
                                            // count: this.state.totalItems,
                                            // rowsPerPage: 10,
                                            // page: this.state.formData.page,
                                                // .page,
                                            onTableChange: (
                                                action,
                                                tableState
                                            ) => {
                                                console.log(
                                                    action,
                                                    tableState
                                                )
                                                switch (action) {
                                                    case 'changePage':
                                                        this.setPage(
                                                            tableState.page
                                                        )
                                                        break
                                                    case 'sort':
                                                        //this.sort(tableState.page, tableState.sortOrder);
                                                        break
                                                    default:
                                                        console.log(
                                                            'action not handled.'
                                                        )
                                                }
                                            },
                                        }}
                                    ></LoonsTable>
                                    :
                                    <Grid className="justify-center text-center w-full pt-12">
                                        <CircularProgress size={30} />
                                    </Grid>
                                    }
                               </Grid>
                            </Grid>                         
                        {/* </fieldset> */}
                        {/* // </ValidatorForm> */}
                        </Card>
                </Grid>
                </Fragment>
        );
    }
}

export default StockInquiryNationalStock
