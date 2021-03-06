package foursomeSE.controller.annotation;

import foursomeSE.entity.annotation.Annotation;
import foursomeSE.entity.annotation.RAnnotations;
import foursomeSE.entity.communicate.report.Reports;
import foursomeSE.error.MyErrorType;
import foursomeSE.error.MyObjectNotFoundException;
import foursomeSE.security.JwtUtil;
import foursomeSE.service.annotation.UpperAnnotationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

public abstract class AbstractAnnotationController<T extends Annotation> {
    protected UpperAnnotationService<T> annotationService;

    public abstract void setAnnotationService(UpperAnnotationService<T> annotationService);

//    @RequestMapping(value = "/id/{id}",
//            method = RequestMethod.GET)
//    public ResponseEntity<?> getAnnotationById(@PathVariable("id") long id) {
//        try {
//            T annotation = annotationService.getById(id);
//            return new ResponseEntity<>(annotation, HttpStatus.OK);
//        } catch (MyObjectNotFoundException e) {
//            return new ResponseEntity<>(new MyErrorType("xxx Annotation with id " + id + " not found"),
//                    HttpStatus.NOT_FOUND);
//        }
//    }

    /**
     * 因之前设计接口失误，加上whatFor的参数
     * 0代表工人draw，1代表工人verifyQuality，2代表工人verifyCoverage，3代表requester查看
     */
    @RequestMapping(value = "/imgName/{imgName}/whatFor/{whatFor}",
            method = RequestMethod.GET)
    public ResponseEntity<?> getByImgName(@RequestHeader("Authorization") String token,
                                          @PathVariable("imgName") String imgName,
                                          @PathVariable("whatFor") int whatFor) {
        String username = JwtUtil.getUsernameFromToken(token);

        T a = annotationService.getByImgName(imgName, whatFor, username);
        if (a == null) {
            return new ResponseEntity<Object>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(a, HttpStatus.OK);
    }

    @RequestMapping(value = "/imgName/{imgName}/whatFor/undefined",
            method = RequestMethod.GET)
    public ResponseEntity<?> getByImgName1(@RequestHeader("Authorization") String token,
                                          @PathVariable("imgName") String imgName) {
        String username = JwtUtil.getUsernameFromToken(token);

        T a = annotationService.getByImgName(imgName, 0, username);
        if (a == null) {
            return new ResponseEntity<Object>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(a, HttpStatus.OK);
    }


    @RequestMapping(value = "/saveAnnotations",
            method = RequestMethod.POST)
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> saveAnnotations(@RequestHeader("Authorization") String token,
                                             @RequestBody RAnnotations<T> rAnnotations) {
        String username = JwtUtil.getUsernameFromToken(token);

        annotationService.saveAnnotations(rAnnotations, username);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/json/taskId/{taskId}",
            method = RequestMethod.GET)
    @PreAuthorize("hasRole('REQUESTER')")
    public ResponseEntity<?> getJsons(@RequestHeader("Authorization") String token,
                                      @PathVariable("taskId") long taskId) {
        String username = JwtUtil.getUsernameFromToken(token);

        Reports json = annotationService.getJson(taskId, username);
        return new ResponseEntity<Object>(json, HttpStatus.OK);
    }


//    @RequestMapping(method = RequestMethod.PUT)
//    @PreAuthorize("hasRole('WORKER')")
//    public ResponseEntity<?> updateAnnotation(@RequestBody T newAnnotation) {
//        try {
//            // 这里需要id？这里重新用newAnnotation set annotation?
//            annotationService.update(newAnnotation);
//            return new ResponseEntity<>(HttpStatus.OK);
//        } catch (MyObjectNotFoundException e) {
//            return new ResponseEntity<>(new MyErrorType("Unable to upate. xxx annotation with id " + newAnnotation.getAnnotationId() + " not found."),
//                    HttpStatus.NOT_FOUND);
//        }
//    }
//
//    @RequestMapping(value = "/taskId/{taskId}",
//            method = RequestMethod.POST)
//    @PreAuthorize("hasRole('WORKER')")
//    public ResponseEntity<?> addAnnotation(@RequestHeader("Authorization") String token, @PathVariable("taskId") long taskId, @RequestBody T annotation/*UriComponentsBuilder ucBuilder*/) {
//        String username = JwtUtil.getUsernameFromToken(token);
//
//        annotationService.addOneBy(taskId, username, annotation);
//        // 这里采取的策略应该是先检查id吧好像应该…
//
//        // 不懂这里的header，和created。。。
////        HttpHeaders headers = new HttpHeaders();
////        headers.setLocation(ucBuilder.path("/api/user/{id}").buildAndExpand(annotation.getAnnotationId()).toUri());
//        return new ResponseEntity<>(HttpStatus.CREATED);
//    }

//    @RequestMapping(value = "/{id}",
//            method = RequestMethod.DELETE)
//    public ResponseEntity<?> deleteAnnotation(@PathVariable("id") long id) {
//        try {
//            annotationService.delete(id);
//            // 这里的no content?
//            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//        } catch (MyObjectNotFoundException e) {
//            return new ResponseEntity<>(new MyErrorType("Unable to delete. annotation with id " + id + " not found."),
//                    HttpStatus.NOT_FOUND);
//        }
//    }
}
