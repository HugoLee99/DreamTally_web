//MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Vars
const data = [
  {
    stats: '245k',
    title: '当月收入',
    color: 'primary',
    icon: 'ri-pie-chart-2-line'
  },
  {
    stats: '12.5k',
    title: '当月支出',
    color: 'success',
    icon: 'ri-group-line'
  },
  {
    stats: '1.54k',
    color: 'warning',
    title: '当月结余',
    icon: 'ri-macbook-line'
  },
  {
    stats: '$88k',
    color: 'info',
    title: '累计存款',
    icon: 'ri-money-dollar-circle-line'
  }
]

const Transactions = () => {
  return (
    <Card className='bs-full'>
      <CardHeader
        title='本月概览'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <p className='mbs-3'>
            <span className='font-medium text-textPrimary'>Total 48.5% Growth 😎</span>
            <span className='text-textSecondary'>this month</span>
          </p>
        }
      />
      <CardContent className='!pbs-5'>
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item xs={6} md={3} key={index}>
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography>{item.title}</Typography>
                  <Typography variant='h5'>{item.stats}</Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Transactions
