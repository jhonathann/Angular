import { Component, OnInit, ViewChild ,Inject} from '@angular/core';
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  feedbackForm: FormGroup;
  feedback : Comment;

  formErrors = {
    "author": "",
    "rating": "",
    "comment": ""
  }

  validationMessages = {
    'author': {
      'required':      'Author Nameis required.',
      'minlength':     'Author  Name must be at least 2 characters long.',
      'maxlength':     'Author Name cannot be more than 25 characters long.'
    },
    'rating': {
      'required':      'Rating is required.',
    },
    'comment': {
      'required':      'Comment is required.',
    },
  };

  constructor(private dishService: DishService, private route: ActivatedRoute, private location: Location, private fb: FormBuilder,
  @Inject("BaseURL") private BaseURL) { }
  
  @ViewChild("fform") feedbackFormDirective;
  
  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); }, errmess => this.errMess = <any>errmess);
    this.createForm();
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      author: ["", [Validators.required, Validators.minLength(2),Validators.maxLength(25)]],
      rating: [0, Validators.required ],
      comment: ["", Validators.required],
    });
    this.feedbackForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //Reset form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        //clear previous error message (if any)
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field]
                = messages[key] + " ";
            }
          }
        }
      }
    }
  }
  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedback.date = new Date().toISOString();
    this.dish.comments.push(this.feedback);
    console.log(this.feedback);
    this.feedbackForm.reset({
      author: "",
      rating: 5,
      comment: ""
    });
    this.feedbackFormDirective.resetForm();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  
  goBack(): void {
    this.location.back();
  }

}
