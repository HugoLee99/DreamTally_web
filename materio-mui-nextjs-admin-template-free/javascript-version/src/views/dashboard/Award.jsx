// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const Award = () => {
  return (
    <Card>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h5'>本月目标存钱金额完成情况 📊</Typography>
          <Typography>离目标又近一步啦！ </Typography>
        </div>
        <div>
          <Typography variant='h4' color='primary'>
            ¥3,580/4,000
          </Typography>
          <Typography>目标完成率：45% </Typography>
        </div>
        <Button size='small' variant='contained'>
          查看详情
        </Button>
        <img
          src='/images/pages/trophy.png'
          alt='trophy image'
          height={102}
          className='absolute inline-end-7 bottom-6'
        />
      </CardContent>
    </Card>
  )
}

export default Award
