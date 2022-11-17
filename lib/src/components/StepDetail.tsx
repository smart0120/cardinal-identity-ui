import styled from "@emotion/styled";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  disabled?: boolean;
  children?: JSX.Element | string
}

export const StepDetail: React.FC<Props> = ({
  icon,
  title,
  description,
  disabled,
  children,
}: Props) => {
  return (
    <Wrapper disabled={disabled} className='border-2 border-black px-4 py-2 rounded-xl'>
      {icon}
      <Info>
        <div className="flex justify-between items-center w-full">
          <Title>{title}</Title>
          {children}
        </div>
        <Description>{description}</Description>
      </Info>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ disabled?: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-column-gap: 10px;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.span`
  font-weight: bold;
  font-size: 20px;
  line-height: 18px;
  letter-spacing: -0.02em;
  color: #000000;
`;

const Description = styled.div`
  margin: 0;
  font-size: 18px;
  line-height: 15px;
  letter-spacing: -0.02em;
  color: #696969;
`;
