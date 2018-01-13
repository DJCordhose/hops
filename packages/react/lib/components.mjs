import { withRouter } from 'react-router/es';

export const Miss = withRouter(function Miss(props) {
  if (props.staticContext) {
    props.staticContext.miss = true;
  }
  return null;
});

export const Status = withRouter(function Status(props) {
  if (props.staticContext) {
    props.staticContext.status = props.code || 200;
  }
  return null;
});
