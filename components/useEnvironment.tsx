import { useRouter } from 'next/router'
import { ENVIRONMENTS, useEnvironmentCtx } from 'providers/EnvironmentProvider'

export const useEnvironment = () => {
  const router = useRouter()
  const { setEnvironment } = useEnvironmentCtx()
  const cluster = router.query['cluster']
  const foundEnvironment = ENVIRONMENTS.find(({ label }) => label === cluster)
  if (foundEnvironment) {
    setEnvironment(foundEnvironment)
  }
}
