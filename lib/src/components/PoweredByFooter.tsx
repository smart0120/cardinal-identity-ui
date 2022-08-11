import { LogoTitled } from '../common/LogoTitled'

export const PoweredByFooter = () => {
  return (
    <div className="text-md mx-auto flex items-center justify-center gap-1">
      <div>POWERED BY</div>
      <LogoTitled color="black" className="inline-block h-3 text-black" />
    </div>
  )
}
