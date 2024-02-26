import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { useState } from 'react'
import { format } from 'date-fns'
import TableHead from './tableHead'
import TableFoot from './tableFoot'
import Row from './row'
import { CircularProgress, Divider, Grid, Snackbar, Typography } from '@material-ui/core'
import { Alert } from '@mui/material'
import PrescriptionService from 'app/services/PrescriptionService'
import PatientServices from 'app/services/PatientServices'
import { useEffect } from 'react'
import LabeledInput from 'app/components/LoonsLabComponents/LabeledInput'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import localStorageService from 'app/services/localStorageService'
import { Button, } from 'app/components/LoonsLabComponents';
import moment from 'moment'
import GroupIcon from '@mui/icons-material/Group';
import { useHistory } from 'react-router-dom';


import { SubTitle } from 'app/components/LoonsLabComponents'
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import WcIcon from '@material-ui/icons/Wc';
import CropFreeOutlinedIcon from '@material-ui/icons/CropFreeOutlined';
import ImageAspectRatioOutlinedIcon from '@material-ui/icons/ImageAspectRatioOutlined';
import NPDrugPrint from 'app/views/Prescription/NPDrugPrint'

const styles = {
    btnContainer: {
        display: 'flex',
        justifyContent: 'end',
        marginTop: 10,
        marginBottom: 10,
    },
    roundButton: {
        borderRadius: 20,
        padding: '5px 10px',
        background: '#06b6d4',
        color: 'white',
        margin: '1px',
        minWidth: '10em',
    },
    roundButtonOutline: {
        borderRadius: 20,
        padding: '5px 10px',
        background: 'white',
        border: '1px solid #06b6d4',
        color: '#06b6d4',
        margin: '1px',
        minWidth: '10em',
    },
}

const NPDrug = (props) => {
    const history = useHistory();

    const { classes, latest, clinic, fetchFavItem } = props
    const [selectedDrug, setSelectedDrug] = useState(null)
    const [drugList, setDrugList] = useState([])
    const [loading, setLoading] = useState(false)
    const [viewSnack, setViewSnack] = useState('')
    const [snackType, setSnackType] = useState('')
    const [patientInfo, setPatientInfo] = useState(null)
    const [loaded, setLoaded] = useState(false)
    // const [favName, setFavName] = useState('')
    // const [favourites, setFavourites] = useState([])
    const vertical = 'bottom'
    const horizontal = 'left'

    const removeDrugByIndex = (index) => {
        const filtered = [...drugList].filter((item, pos) => pos !== index)
        setDrugList(filtered)
    }

    // const fetchFav = async () => {
    //     var user = await localStorageService.getItem('userInfo')
    //     var doctor_id = user.id
    //     PrescriptionService.fetchFavourites({
    //         clinic_id: '9b9aff26-2275-4853-b315-7fe834bfe589',
    //         doctor_id: doctor_id,
    //     }).then((favOut) => {
    //         if (favOut.data.view.data) {
    //             const favs = favOut.data.view.data.map((fav) => {
    //                 return { label: fav.name, value: fav.id }
    //             })
    //             setFavourites(favs)
    //         }
    //     })
    // }

    // useEffect(() => {
    //     fetchFav()
    // }, [])

    const loadData = async () => {
        const patient = localStorageService.getItem("patientSummary")
        if (patient) {
            setPatientInfo(patient.patientDetails)
        }
        // console.log(typeof (patient.patientDetails))
        // console.log(patient.patientDetails)

        setLoaded(true)
    }

    useEffect(() => {
        if (latest) {
            setDrugList(latest.drugs)
        }
        loadData()
    }, [latest])

    const handleSubmit = async () => {
        setLoading(true)
        console.log("DL", drugList)
        const drugsArr = []
        const loginUserHospital = localStorageService.getItem("Login_user_Hospital")
        // FIXME: this is not hospital ID. this should be corrected to hospital ID
        const mainHospitalId = localStorageService.getItem("main_hospital_id")
        const patient = localStorageService.getItem("patientSummary")

        const user = localStorageService.getItem("userInfo")
        const owner_id = localStorageService.getItem("owner_id")
        console.log("PPPPP", patient)
        const drugs = []
        if (patient != null && owner_id !== null && user?.id !== null) {
            if (drugList.length > 0) {
                drugList.forEach((drug) => {
                    drug.params.forEach((subitem) => {
                        let item = {
                            "item_id": drug.drug_id,
                            "item_name": drug.drug,
                            "requested_by": user.id,
                            "action_by": user.id,
                            "dose": subitem.dosage,
                            "frequency_id": subitem.frequency_id,
                            // FIXME:
                            "duration": subitem.duration,
                            "suggested_quantity": subitem.quantity,
                            "expected_treatment_date": moment(subitem.expected_treatment_date).format('yyyy-MM-DD'),
                            "patient_id": patient.patientDetails.id,
                            "clinic_id": loginUserHospital.clinic_id,
                            "owner_id": owner_id,
                            //FIXME: 
                            "hospital_id": mainHospitalId
                        }
                        drugs.push(item)
                    })
                })
            } else {
                setSnackType('error')
                setViewSnack('Select drug first')
            }
        } else if (owner_id === null) {
            setSnackType('error')
            setViewSnack('Owner ID not Found')
        }
        else if (patient === null) {
            setSnackType('error')
            setViewSnack('Patient not Found')
        }
        else {
            setSnackType('error')
            setViewSnack('User ID not found')
        }

        if (drugs.length > 0) {
            drugs.forEach(async (x) => {
                let res = await PrescriptionService.createNPRequest(x)
                if (res.status !== 200 && res.status !== 201) {
                    setSnackType('error')
                    setViewSnack(x.item_name, 'Error occured Status')
                } else {
                    setSnackType('success')
                    setViewSnack('Request submitted')
                    // history.goBack()
                }
                console.log(res)
            })
        }
        setLoading(false)


        // drugList.forEach((drug) => {
        //     drug.quantity = 0
        //     drug.params.forEach((obj, index) => {
        //         drug.quantity += Math.ceil(
        //             obj.duration * obj.dosage * (obj.frequency_val ?? 1)
        //         )
        //         drug.params[index].quantity = Math.ceil(
        //             obj.duration * obj.dosage * (obj.frequency_val ?? 1)
        //         )
        //     })
        //     drug.drug_name = drug.drug
        //     drug.short_name = drug.short_name
        //     drugsArr.push(drug)
        // })
        // var user = await localStorageService.getItem('userInfo')
        // var doctor_id = user.id
        // var loginHospital = await localStorageService.getItem(
        //     'Login_user_Hospital'
        // )

        // const param = {
        //     clinic_id: window.dashboardVariables.clinic_id,
        //     doctor_id: doctor_id,
        //     patient_id: window.dashboardVariables.patient_id,
        //     doctor_remark: '',
        //     owner_id: loginHospital.owner_id,
        //     drugs: drugsArr,
        //     latest_update_date_time: new Date()
        //         .toJSON()
        //         .slice(0, 19)
        //         .replace('T', ' '),
        //     name: favName,
        //     type: 'Clinical Doctor',
        // }

        // PrescriptionService.createFavourite(param)
        //     .then((out) => {
        //         console.log(out.status)
        //         if (out.status !== 200 && out.status !== 201) {
        //             setSnackType('error')
        //             setViewSnack('Error occured Status')
        //         } else {
        //             setSnackType('success')
        //             setViewSnack('Favourite submitted')
        //             fetchFav()
        //         }
        //         setLoading(false)
        //     })
        //     .catch((e) => {
        //         setSnackType('error')
        //         setViewSnack('Error occured Exception')
        //         console.log(e)
        //         setLoading(false)
        //     })
    }

    return (
        <ValidatorForm
            onSubmit={() => handleSubmit()}
        >
            <Grid container className='px-2'>
                {loaded && patientInfo ?
                    <>
                        <SubTitle title='Patient Details' className='mt-2 mb-2' />
                        <Grid container>
                            <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                {/* <SubTitle title={"Name"}></SubTitle> */}
                                <PermIdentityIcon className='mt-2'></PermIdentityIcon>
                            </Grid>
                            <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4' >
                                {patientInfo.name ? patientInfo.name : 'Not Available'}
                            </Grid>
                        </Grid>
                        {/*************************** */}
                        <Grid container>
                            <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                <CropFreeOutlinedIcon className='mt-2'></CropFreeOutlinedIcon>
                            </Grid>
                            <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4' >
                                {patientInfo.phn ? patientInfo.phn : "Not Available"}
                            </Grid>
                        </Grid>
                        {/*************************** */}
                        <Grid container>
                            <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                <WcIcon className='mt-2'></WcIcon>
                            </Grid>
                            <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4' >
                                {patientInfo.gender ? patientInfo.gender : "Not Available"}
                            </Grid>
                        </Grid>
                        {/*************************** */}
                        {/*  <Grid container>
                                <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                    <CalendarTodayOutlinedIcon className='mt-2'></CalendarTodayOutlinedIcon>
                                </Grid>
                                <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4' >
                                    {Util.dateParse(this.state.patient.date_of_birth)}
                                </Grid>
                            </Grid> */}
                        {/*************************** */}
                        <Grid container>
                            <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                <ImageAspectRatioOutlinedIcon className='mt-2'></ImageAspectRatioOutlinedIcon>
                            </Grid>
                            <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4' >
                                {patientInfo.patient_age ? patientInfo.patient_age.age_years + " Y " + patientInfo.patient_age.age_months + " M " + patientInfo.patient_age.age_days + " D " : "Not Available"}
                            </Grid>
                        </Grid>
                        {/*************************** */}
                        <Grid container>

                            <Grid item lg={1} md={1} sm={1} xs={1} className='' >
                                <GroupIcon className='mt-2' />
                            </Grid>
                            <Grid item lg={11} md={11} sm={11} xs={11} className='mt-2 pl-4'>
                                {patientInfo.marital_status ? patientInfo.marital_status : "Not Available"}
                            </Grid>
                        </Grid>
                        <Divider />
                    </>
                    : <>
                        <Typography variant='h6' style={{ color: '#CA5555' }}>Patient Not Found</Typography>
                    </>}
            </Grid>
            <TableHead />
            {drugList.map((drug, index) => (
                <Row
                    key={index}
                    drug={drug}
                    index={index}
                    remove={removeDrugByIndex}
                    select={setSelectedDrug}
                    selected={selectedDrug}
                />
            ))}
            <TableFoot
                index={selectedDrug ?? drugList.length}
                drugList={drugList}
                select={setSelectedDrug}
                setDrugList={setDrugList}
                selectedDrug={
                    selectedDrug !== null ? drugList[selectedDrug] : null
                }
            />
            <div className={classes.btnContainer}>
                {!loading ? (
                    <Button
                        startIcon="send"
                        variant='contained'
                        color='primary'
                        type="submit"
                    // className={classes.roundButton} 
                    // onClick={onSubmit}
                    >
                        Send for director approval
                    </Button>
                ) : null}
            </div>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={viewSnack}
                autoHideDuration={3000}
                onClose={() => setViewSnack('')}
            >
                <Alert
                    onClose={() => setViewSnack('')}
                    severity={snackType}
                    sx={{ width: '100%' }}
                >
                    {viewSnack}
                </Alert>
            </Snackbar>
            {patientInfo && <NPDrugPrint drug={drugList} redirect={false} />}
        </ValidatorForm>
    )
}

NPDrug.propTypes = {}

export default withStyles(styles)(NPDrug)
