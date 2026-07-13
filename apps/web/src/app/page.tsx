import HomeExperience from '@/sections/home/HomeExperience'
import { getHomePageData } from '@/lib/home-data'

export const revalidate = 60

export default async function HomePage() {
  const data = await getHomePageData()
  return <HomeExperience locale="en" data={data} />
}
