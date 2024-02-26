import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/styles'
import {
    Card,
    TextField,
    MenuItem,
    IconButton,
    Icon,
    Grid,
    Switch,
    Typography,
    Radio,
    RadioGroup,
    Divider,
    Tooltip,
    CircularProgress,
    TableCell,
    Table,
    TableBody,
    InputAdornment,
    TableRow,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core'
import { themeColors } from 'app/components/MatxTheme/themeColors'
import { MatxLayoutSettings } from 'app/components/MatxLayout/settings'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import VisibilityIcon from '@material-ui/icons/Visibility'
import EditIcon from '@material-ui/icons/Edit'
import * as appConst from '../../../../../appconst'

import {
    LoonsTable,
    DatePicker,
    Button,
    FilePicker,
    ExcelToTable,
    LoonsSnackbar,
    LoonsDialogBox,
    LoonsSwitch,
    LoonsCard,
    CardTitle,
    SubTitle,
    Charts,
} from 'app/components/LoonsLabComponents'
// import LoonsDiaLogBox from 'app/components/LoonsLabComponents/Dialogbox'
import { dateParse } from 'utils'
import PropTypes from 'prop-types'

import ExaminationServices from 'app/services/ExaminationServices'
import { Autocomplete } from '@material-ui/lab'
import { BottomButtonGroup } from './BottomButtonGroup/BottomButtonGroup'

const styleSheet = (theme) => ({})

const initial_form_data = {
    name: '',
    description: '',
}

const dialogBox_faculty_data = {
    id: '',
    name: '',
    description: '',
}

const checkBoxData_L = [
    {
        label: 'Anterior Triangle',
        value: 'anteriorTriangle_L',
    },
    {
        label: 'Axillary',
        value: 'axillary_L',
    },
    {
        label: 'Inguinal',
        value: 'inguinal_L',
    },
    {
        label: 'Epitrochlear',
        value: 'epitrochlear_L',
    },
    {
        label: 'Supraclavicular',
        value: 'supraclavicular_L',
    },
]

const checkBoxData_R = [
    {
        label: 'Anterior Triangle',
        value: 'anteriorTriangle_R',
    },
    {
        label: 'Axillary',
        value: 'axillary_R',
    },
    {
        label: 'Inguinal',
        value: 'inguinal_R',
    },
    {
        label: 'Epitrochlear',
        value: 'epitrochlear_R',
    },
    {
        label: 'Supraclavicular',
        value: 'supraclavicular_R',
    },
]

class Other extends Component {
    constructor(props) {
        super(props)
        this.state = {
            alert: false,
            message: 'Complications is added Successfull',
            severity: 'success',
            data: [],

            formData: {
                //dashboard_id:"d0865518-530d-47ec-8f39-5f338f5c3874",
                patient_id: window.dashboardVariables.patient_clinic_id,
                widget_id: this.props.widget_id,
                examination_data: [
                    {
                        widget_input_id: this.props.itemId,
                        question: 'other',
                        other_answers: {
                            neckRigidity: 'no',
                            kernigsSign: 'no',
                            lymphadenopathy: 'no',
                            anteriorTriangle_L: false,
                            axillary_L: false,
                            inguinal_L: false,
                            epitrochlear_L: false,
                            supraclavicular_L: false,
                            anteriorTriangle_R: false,
                            axillary_R: false,
                            inguinal_R: false,
                            epitrochlear_R: false,
                            supraclavicular_R: false,
                        },
                    },
                ],
            },
        }
    }

    static propTypes = {
        onReload: PropTypes.func,
    }

    async loadData() {
        this.setState({
            // loaded: false,
            // data: [],
        })
        let params = {
            patient_id: window.dashboardVariables.patient_id,
            widget_input_id: this.props.itemId,
            question: 'other',
            'order[0]': ['createdAt', 'DESC'],
            limit: 10,
        }

        let res
        if (this.props.loadFromCloud) {
            res = await ExaminationServices.getDataFromCloud(params)
        } else {
            res = await ExaminationServices.getData(params)
        }
        //console.log("Examination Data ", res)
        if (200 == res.status) {
            console.log('Examination Data Other', res.data.view.data)
            this.setState({ data: [] })
            let data = []
            let other_answers = []

            res.data.view.data.forEach((element) => {
                data.push(element.other_answers)
            })
            this.setState({ data: data, loaded: true })
        }
    }

    async submit() {
        console.log('formdata', this.state.formData)
        let formData = this.state.formData

        let res = await ExaminationServices.saveData(formData)
        console.log('Examination Data added', res)
        if (201 == res.status) {
            this.setState(
                {
                    alert: true,
                    message: 'Examination Data Added Successful',
                    severity: 'success',
                },
                () => {
                    this.loadData()
                    //this.onReload()
                }
            )
        }
    }

    async onReload() {
        const { onReload } = this.props

        onReload && onReload()
    }

    //set input value changes
    componentDidMount() {
        console.log('item id', this.props.itemId)
        this.loadData()
        //this.interval = setInterval(() => this.loadData(), 5000);
    }
    componentWillUnmount() {
        // clearInterval(this.interval);
    }

    render() {
        let { theme } = this.props
        const { classes } = this.props
        let activeTheme = MatxLayoutSettings.activeTheme

        return (
            <Fragment>
                <ValidatorForm
                    onSubmit={() => {
                        this.submit()
                    }}
                    className="flex mx-2"
                >
                    <Grid container spacing={1}>
                        {/* Neck Rigidity */}
                        <Grid className="" item lg={12} md={12} sm={12} xs={12}>
                            <SubTitle title="Neck Rigidity" />
                            <RadioGroup
                                defaultValue={
                                    this.state.formData.examination_data[0]
                                        .other_answers.neckRigidity
                                }
                                row
                            >
                                <FormControlLabel
                                    label={'No'}
                                    name="no"
                                    value="no"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.neckRigidity =
                                            'no'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={this.state.formData.examination_data[0].other_answers.probable}
                                />

                                <FormControlLabel
                                    label={'Present'}
                                    name="present"
                                    value="present"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.neckRigidity =
                                            'present'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={
                                    //     !this.state.formData.examination_data[0].other_answers.probable
                                    // }
                                />
                            </RadioGroup>
                        </Grid>

                        {/* Kernigs Sign */}
                        <Grid className="" item lg={12} md={12} sm={12} xs={12}>
                            <SubTitle title="Kernigs Sign" />
                            <RadioGroup
                                defaultValue={
                                    this.state.formData.examination_data[0]
                                        .other_answers.kernigsSign
                                }
                                row
                            >
                                <FormControlLabel
                                    label={'No'}
                                    name="no"
                                    value="no"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.kernigsSign =
                                            'no'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={this.state.formData.examination_data[0].other_answers.probable}
                                />

                                <FormControlLabel
                                    label={'Present'}
                                    name="present"
                                    value="present"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.kernigsSign =
                                            'present'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={
                                    //     !this.state.formData.examination_data[0].other_answers.probable
                                    // }
                                />
                            </RadioGroup>
                        </Grid>

                        {/* Lymphandenopathy */}
                        <Grid className="" item lg={12} md={12} sm={12} xs={12}>
                            <SubTitle title="Lymphandenopathy" />
                            <RadioGroup
                                defaultValue={
                                    this.state.formData.examination_data[0]
                                        .other_answers.lymphadenopathy
                                }
                                row
                            >
                                <FormControlLabel
                                    label={'No'}
                                    name="no"
                                    value="no"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.lymphadenopathy =
                                            'no'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={this.state.formData.examination_data[0].other_answers.probable}
                                />

                                <FormControlLabel
                                    label={'Present'}
                                    name="present"
                                    value="present"
                                    onChange={() => {
                                        let formData = this.state.formData
                                        formData.examination_data[0].other_answers.lymphadenopathy =
                                            'present'
                                        this.setState({ formData })
                                    }}
                                    control={
                                        <Radio size="small" color="primary" />
                                    }
                                    display="inline"
                                    // checked={
                                    //     !this.state.formData.examination_data[0].other_answers.probable
                                    // }
                                />
                            </RadioGroup>
                        </Grid>

                        {this.state.formData.examination_data[0].other_answers
                            .lymphadenopathy == 'present' ? (
                            <Grid
                                className=""
                                item
                                lg={12}
                                md={12}
                                sm={12}
                                xs={12}
                            >
                                <SubTitle title="Left" />
                                {checkBoxData_L.map((data) => (
                                    <FormControlLabel
                                        // key={i}
                                        label={data.label}
                                        name={data.value}
                                        value={data.value}
                                        onChange={() => {
                                            let formData = this.state.formData
                                            formData.examination_data[0].other_answers[
                                                data.value
                                            ] =
                                                !formData.examination_data[0]
                                                    .other_answers[data.value]
                                            this.setState({ formData })
                                        }}
                                        defaultValue="normal"
                                        control={
                                            <Checkbox
                                                color="primary"
                                                // checked={field.displayInSmallView}
                                                size="small"
                                            />
                                        }
                                        display="inline"
                                    />
                                ))}
                            </Grid>
                        ) : null}

                        {this.state.formData.examination_data[0].other_answers
                            .lymphadenopathy == 'present' ? (
                            <Grid
                                className=""
                                item
                                lg={12}
                                md={12}
                                sm={12}
                                xs={12}
                            >
                                <SubTitle title="Right" />
                                {checkBoxData_R.map((data) => (
                                    <FormControlLabel
                                        // key={i}
                                        label={data.label}
                                        name={data.value}
                                        value={data.value}
                                        onChange={() => {
                                            let formData = this.state.formData
                                            formData.examination_data[0].other_answers[
                                                data.value
                                            ] =
                                                !formData.examination_data[0]
                                                    .other_answers[data.value]
                                            this.setState({ formData })
                                        }}
                                        defaultValue="normal"
                                        control={
                                            <Checkbox
                                                color="primary"
                                                // checked={field.displayInSmallView}
                                                size="small"
                                            />
                                        }
                                        display="inline"
                                    />
                                ))}
                            </Grid>
                        ) : null}

                        {/* save */}
                        <BottomButtonGroup />
                    </Grid>
                </ValidatorForm>
                <LoonsSnackbar
                    open={this.state.alert}
                    onClose={() => {
                        this.setState({ alert: false })
                    }}
                    message={this.state.message}
                    autoHideDuration={3000}
                    severity={this.state.severity}
                    elevation={2}
                    variant="filled"
                ></LoonsSnackbar>
            </Fragment>
        )
    }
}

export default withStyles(styleSheet)(Other)
